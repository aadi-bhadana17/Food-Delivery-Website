package com.kilgore.fooddeliveryapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoleChangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private USER_ROLE requestedRole;

    @Enumerated(EnumType.STRING)
    private REQUEST_STATUS requestStatus;

    @ManyToOne
    @JoinColumn(name = "handled_by_user_id")
    private User handledBy;

    private LocalDateTime requestedAt;
    private LocalDateTime respondedAt;
    private String requestReason;

    @PrePersist
    public void prePersist() {
        this.requestStatus = REQUEST_STATUS.PENDING;
        this.requestedAt = LocalDateTime.now();
    }

}
