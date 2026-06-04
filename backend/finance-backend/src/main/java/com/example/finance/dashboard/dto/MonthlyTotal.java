package com.example.finance.dashboard.dto;

import java.math.BigDecimal;

public class MonthlyTotal {

    private int month;
    private BigDecimal totalExpense;

    public MonthlyTotal() {
    }

    public MonthlyTotal(int month, BigDecimal totalExpense) {
        this.month = month;
        this.totalExpense = totalExpense;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public BigDecimal getTotalExpense() {
        return totalExpense;
    }

    public void setTotalExpense(BigDecimal totalExpense) {
        this.totalExpense = totalExpense;
    }
}
