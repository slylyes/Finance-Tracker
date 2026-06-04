package com.example.finance.goal.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class GoalResponse {

    private Long id;
    private String name;
    private BigDecimal targetAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal currentAmount;
    private BigDecimal progressPercent;

    public GoalResponse() {
    }

    public GoalResponse(Long id, String name, BigDecimal targetAmount, LocalDate startDate, LocalDate endDate,
            BigDecimal currentAmount, BigDecimal progressPercent) {
        this.id = id;
        this.name = name;
        this.targetAmount = targetAmount;
        this.startDate = startDate;
        this.endDate = endDate;
        this.currentAmount = currentAmount;
        this.progressPercent = progressPercent;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getTargetAmount() {
        return targetAmount;
    }

    public void setTargetAmount(BigDecimal targetAmount) {
        this.targetAmount = targetAmount;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getCurrentAmount() {
        return currentAmount;
    }

    public void setCurrentAmount(BigDecimal currentAmount) {
        this.currentAmount = currentAmount;
    }

    public BigDecimal getProgressPercent() {
        return progressPercent;
    }

    public void setProgressPercent(BigDecimal progressPercent) {
        this.progressPercent = progressPercent;
    }
}
