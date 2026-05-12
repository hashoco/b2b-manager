package com.laundry.b2b_manager.entity.auth;

public enum SubscriptionStatus {
    TRIAL,    // 30일 무료 체험 중
    ACTIVE,   // 정상 결제되어 이용 중
    EXPIRED   // 기간 만료됨
}