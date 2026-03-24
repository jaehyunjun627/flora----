package com.flora.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class OrderRequest {

    @NotBlank(message = "배송 주소를 입력해주세요")
    private String deliveryAddress;

    @NotBlank(message = "수령인 이름을 입력해주세요")
    private String recipientName;

    @NotBlank(message = "수령인 전화번호를 입력해주세요")
    private String recipientPhone;
}
