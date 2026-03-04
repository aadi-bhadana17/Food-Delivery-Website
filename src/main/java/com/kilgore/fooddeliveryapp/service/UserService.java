package com.kilgore.fooddeliveryapp.service;

import com.kilgore.fooddeliveryapp.dto.request.AddressRequest;
import com.kilgore.fooddeliveryapp.dto.request.RoleChangeRequestDto;
import com.kilgore.fooddeliveryapp.dto.request.UpdateProfileRequest;
import com.kilgore.fooddeliveryapp.dto.response.AddressResponse;
import com.kilgore.fooddeliveryapp.dto.response.ProfileResponse;
import com.kilgore.fooddeliveryapp.dto.response.RestaurantResponse;
import com.kilgore.fooddeliveryapp.dto.response.RoleChangeRequestResponse;
import com.kilgore.fooddeliveryapp.exceptions.EntityNotFoundException;
import com.kilgore.fooddeliveryapp.exceptions.EntityMisMatchAssociationException;
import com.kilgore.fooddeliveryapp.model.Address;
import com.kilgore.fooddeliveryapp.model.Restaurant;
import com.kilgore.fooddeliveryapp.model.RoleChangeRequest;
import com.kilgore.fooddeliveryapp.model.User;
import com.kilgore.fooddeliveryapp.repository.AddressRepository;
import com.kilgore.fooddeliveryapp.repository.RestaurantRepository;
import com.kilgore.fooddeliveryapp.repository.RoleChangeRequestRepository;
import com.kilgore.fooddeliveryapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleChangeRequestRepository roleChangeRequestRepository;
    @Autowired
    private AddressRepository addressRepository;
    @Autowired
    private RestaurantRepository restaurantRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName());
    }

    public ProfileResponse getProfile() {
        User user = getCurrentUser();
        return new ProfileResponse(user.getUserId(), user.getFirstName(), user.getLastName(),
                user.getEmail(), user.getPhone(), user.getRole());
    }

    public ProfileResponse updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        userRepository.save(user);
        return new ProfileResponse(user.getUserId(), user.getFirstName(), user.getLastName(),
                user.getEmail(), user.getPhone(), user.getRole());
    }

    public List<AddressResponse> getAddresses() {
        User user = getCurrentUser();
        return user.getAddresses().stream().map(this::toAddressResponse).collect(Collectors.toList());
    }

    public AddressResponse addAddress(AddressRequest request) {
        User user = getCurrentUser();
        Address address = new Address();
        address.setBuildingNo(request.getBuildingNo());
        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        address.setLandmark(request.getLandmark());
        address.setDefault(false);
        address.setUser(user);
        addressRepository.save(address);
        user.getAddresses().add(address);
        userRepository.save(user);
        return toAddressResponse(address);
    }

    private void validateAddressOwnership(Address address, User user) {
        if (address.getUser() == null || !address.getUser().getUserId().equals(user.getUserId())) {
            throw new EntityMisMatchAssociationException("Address does not belong to the current user");
        }
    }

    public AddressResponse updateAddress(Long id, AddressRequest request) {
        User user = getCurrentUser();
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Address not found with id: " + id));
        validateAddressOwnership(address, user);
        if (request.getBuildingNo() != null) address.setBuildingNo(request.getBuildingNo());
        if (request.getStreet() != null) address.setStreet(request.getStreet());
        if (request.getCity() != null) address.setCity(request.getCity());
        if (request.getState() != null) address.setState(request.getState());
        if (request.getPincode() != null) address.setPincode(request.getPincode());
        if (request.getLandmark() != null) address.setLandmark(request.getLandmark());
        addressRepository.save(address);
        return toAddressResponse(address);
    }

    public void deleteAddress(Long id) {
        User user = getCurrentUser();
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Address not found with id: " + id));
        validateAddressOwnership(address, user);
        user.getAddresses().remove(address);
        userRepository.save(user);
        addressRepository.delete(address);
    }

    public AddressResponse setDefaultAddress(Long id) {
        User user = getCurrentUser();
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Address not found with id: " + id));
        validateAddressOwnership(address, user);
        user.getAddresses().forEach(a -> a.setDefault(false));
        addressRepository.saveAll(user.getAddresses());
        address.setDefault(true);
        addressRepository.save(address);
        return toAddressResponse(address);
    }

    public List<RestaurantResponse> getFavourites() {
        User user = getCurrentUser();
        return user.getFavourites().stream().map(this::toRestaurantResponse).collect(Collectors.toList());
    }

    public List<RestaurantResponse> addFavourite(Long restaurantId) {
        User user = getCurrentUser();
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new EntityNotFoundException("Restaurant not found with id: " + restaurantId));
        if (!user.getFavourites().contains(restaurant)) {
            user.getFavourites().add(restaurant);
            userRepository.save(user);
        }
        return user.getFavourites().stream().map(this::toRestaurantResponse).collect(Collectors.toList());
    }

    public List<RestaurantResponse> removeFavourite(Long restaurantId) {
        User user = getCurrentUser();
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new EntityNotFoundException("Restaurant not found with id: " + restaurantId));
        user.getFavourites().remove(restaurant);
        userRepository.save(user);
        return user.getFavourites().stream().map(this::toRestaurantResponse).collect(Collectors.toList());
    }

    public RoleChangeRequestResponse createRoleChangeRequest(RoleChangeRequestDto request) {
        User user = getCurrentUser();

        RoleChangeRequest roleChangeRequest = new RoleChangeRequest();
        roleChangeRequest.setUser(user);
        roleChangeRequest.setRequestedRole(request.getRequestedRole());
        roleChangeRequest.setRequestReason(request.getRequestReason());

        roleChangeRequestRepository.save(roleChangeRequest);

        return new RoleChangeRequestResponse(
                roleChangeRequest.getRequestId(),
                user.getFirstName() + " " + user.getLastName(),
                user.getEmail(),
                roleChangeRequest.getRequestedRole(),
                roleChangeRequest.getRequestStatus(),
                roleChangeRequest.getRequestReason(),
                roleChangeRequest.getRequestedAt(),
                null,
                null,
                null
        );
    }

    private AddressResponse toAddressResponse(Address address) {
        return new AddressResponse(address.getAddressId(), address.getBuildingNo(), address.getStreet(),
                address.getCity(), address.getState(), address.getPincode(), address.getLandmark(),
                address.isDefault());
    }

    private RestaurantResponse toRestaurantResponse(Restaurant restaurant) {
        return new RestaurantResponse(
                restaurant.getRestaurantId(),
                restaurant.getRestaurantName(),
                null,
                restaurant.getCuisineType(),
                null,
                null,
                restaurant.getOpeningTime(),
                restaurant.getClosingTime(),
                restaurant.isOpen(),
                restaurant.getRegistrationDate()
        );
    }
}
