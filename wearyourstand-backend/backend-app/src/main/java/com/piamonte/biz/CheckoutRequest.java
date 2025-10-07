package com.piamonte.biz;

import jakarta.validation.constraints.NotNull;

public class CheckoutRequest {
    @NotNull
    private AddressDto shippingAddress;
    @NotNull
    private AddressDto billingAddress;
    private String notes;

    public CheckoutRequest() {}

    public AddressDto getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(AddressDto shippingAddress) { this.shippingAddress = shippingAddress; }
    public AddressDto getBillingAddress() { return billingAddress; }
    public void setBillingAddress(AddressDto billingAddress) { this.billingAddress = billingAddress; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}





















