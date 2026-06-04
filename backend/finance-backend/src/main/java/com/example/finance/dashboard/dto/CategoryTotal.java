package com.example.finance.dashboard.dto;

import java.math.BigDecimal;

public class CategoryTotal {

    private Long categoryId;
    private String categoryName;
    private BigDecimal totalExpense;

    public CategoryTotal() {
    }

    public CategoryTotal(Long categoryId, String categoryName, BigDecimal totalExpense) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.totalExpense = totalExpense;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public BigDecimal getTotalExpense() {
        return totalExpense;
    }

    public void setTotalExpense(BigDecimal totalExpense) {
        this.totalExpense = totalExpense;
    }
}
