package com.soul.lms.model.entity.studymaterial;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@EqualsAndHashCode(callSuper = false)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseMaterialEntity extends WhoseColumnsEntity{

    @NotBlank(message = "username cannot be blank")
    @JsonProperty("username")
    private String username;

    @NotNull(message = "materialId cannot be null")
    @JsonProperty("materialId")
    private Long materialId;

    @JsonProperty("paymentStatus")
    private String paymentStatus;
    
}
