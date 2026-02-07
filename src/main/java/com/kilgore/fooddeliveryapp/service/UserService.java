package com.kilgore.fooddeliveryapp.service;

import com.kilgore.fooddeliveryapp.dto.request.RoleChangeRequestDto;
import com.kilgore.fooddeliveryapp.dto.response.RoleChangeRequestResponse;
import com.kilgore.fooddeliveryapp.model.RoleChangeRequest;
import com.kilgore.fooddeliveryapp.model.User;
import com.kilgore.fooddeliveryapp.repository.RoleChangeRequestRepository;
import com.kilgore.fooddeliveryapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleChangeRequestRepository roleChangeRequestRepository;

    public RoleChangeRequestResponse createRoleChangeRequest(RoleChangeRequestDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(authentication.getName());

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
}
