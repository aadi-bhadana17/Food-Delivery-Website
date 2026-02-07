package com.kilgore.fooddeliveryapp.controller;

import com.kilgore.fooddeliveryapp.dto.request.RoleChangeRequestDecisionDto;
import com.kilgore.fooddeliveryapp.dto.response.RoleChangeRequestResponse;
import com.kilgore.fooddeliveryapp.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasAnyAuthority('ADMIN')")
@RequestMapping("/api/admin")

public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/role-requests")
    public List<RoleChangeRequestResponse> getRoleRequests() {
        return adminService.getAllRoleRequests();
    }

    @PutMapping("/role-requests/{requestId}")
    public RoleChangeRequestResponse updateRoleRequest(@RequestBody RoleChangeRequestDecisionDto request,
                                                       @PathVariable Long requestId) {
        return adminService.updateRole(request, requestId);
    }
}
