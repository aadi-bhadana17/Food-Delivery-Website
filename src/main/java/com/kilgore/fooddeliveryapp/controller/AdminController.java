package com.kilgore.fooddeliveryapp.controller;

import com.kilgore.fooddeliveryapp.dto.request.RoleChangeRequestDecisionDto;
import com.kilgore.fooddeliveryapp.dto.response.OrderResponse;
import com.kilgore.fooddeliveryapp.dto.response.RoleChangeRequestResponse;
import com.kilgore.fooddeliveryapp.service.AdminService;
import com.kilgore.fooddeliveryapp.service.OrderService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasAnyAuthority('ADMIN')")
@RequestMapping("/api/admin")

public class AdminController {

    private final AdminService adminService;
    private final OrderService orderService;

    public AdminController(AdminService adminService, OrderService orderService) {
        this.adminService = adminService;
        this.orderService = orderService;
    }

    @GetMapping("/role-requests")
    public List<RoleChangeRequestResponse> getRoleRequests() {
        return adminService.getAllRoleRequests();
    }

    @PutMapping("/role-requests/{requestId}")
    public RoleChangeRequestResponse updateRoleRequest(@RequestBody RoleChangeRequestDecisionDto request,
                                                       @PathVariable Long requestId) {
        return adminService.updateRole(request, requestId);
    }

    @GetMapping("/orders")
    public List<OrderResponse> getAllOrders() {
        return orderService.getAllOrders();
    }
}
