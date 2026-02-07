package com.kilgore.fooddeliveryapp.service;

import com.kilgore.fooddeliveryapp.dto.request.RoleChangeRequestDecisionDto;
import com.kilgore.fooddeliveryapp.dto.response.RoleChangeRequestResponse;
import com.kilgore.fooddeliveryapp.exceptions.InvalidResponseForRoleChangeRequest;
import com.kilgore.fooddeliveryapp.exceptions.RequestNotFoundException;
import com.kilgore.fooddeliveryapp.model.REQUEST_STATUS;
import com.kilgore.fooddeliveryapp.model.RoleChangeRequest;
import com.kilgore.fooddeliveryapp.model.User;
import com.kilgore.fooddeliveryapp.repository.RoleChangeRequestRepository;
import com.kilgore.fooddeliveryapp.repository.UserRepository;
import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminService {

    @Autowired
    private RoleChangeRequestRepository roleChangeRequestRepository;
    @Autowired
    private UserRepository userRepository;

    public List<RoleChangeRequestResponse> getAllRoleRequests() {
        return roleChangeRequestRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    private RoleChangeRequestResponse toDto(RoleChangeRequest request) {
        RoleChangeRequestResponse dto = new RoleChangeRequestResponse();

        dto.setRequestId(request.getRequestId());
        dto.setUserName(request.getUser().getFirstName() + " " + request.getUser().getLastName());
        dto.setUserEmail(request.getUser().getEmail());
        dto.setRequestedRole(request.getRequestedRole());
        dto.setRequestStatus(request.getRequestStatus());
        dto.setRequestReason(request.getRequestReason());
        dto.setRequestedAt(request.getRequestedAt());

        if(request.getHandledBy() != null) {
            dto.setRespondedAt(request.getRespondedAt());
            dto.setAdminName(request.getHandledBy().getFirstName() + " " + request.getHandledBy().getLastName());
            dto.setAdminEmail(request.getHandledBy().getEmail());
        }

        return dto;
    }

    public RoleChangeRequestResponse updateRole(RoleChangeRequestDecisionDto request, Long requestId) {
        RoleChangeRequest roleChangeRequest = roleChangeRequestRepository.findById(requestId)
                .orElseThrow(() -> new RequestNotFoundException(requestId));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User admin = (User) userRepository.findByEmail(authentication.getName());

        if(request.getAction().equalsIgnoreCase("approve")) {
            User user = roleChangeRequest.getUser();

            roleChangeRequest.setRespondedAt(LocalDateTime.now());
            roleChangeRequest.setHandledBy(admin);
            roleChangeRequest.setRequestStatus(REQUEST_STATUS.APPROVED);
            roleChangeRequestRepository.save(roleChangeRequest);

            user.setRole(roleChangeRequest.getRequestedRole());
        }
        else if(request.getAction().equalsIgnoreCase("reject")) {
            roleChangeRequest.setRespondedAt(LocalDateTime.now());
            roleChangeRequest.setHandledBy(admin);
            roleChangeRequest.setRequestStatus(REQUEST_STATUS.REJECTED);
            roleChangeRequestRepository.save(roleChangeRequest);
        }
        else {
            throw new InvalidResponseForRoleChangeRequest("Invalid action");
        }

        return toDto(roleChangeRequest);
    }
}
