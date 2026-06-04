package com.example.finance.goal;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.finance.common.ResourceNotFoundException;
import com.example.finance.goal.dto.GoalRequest;
import com.example.finance.goal.dto.GoalResponse;
import com.example.finance.transaction.Transaction;
import com.example.finance.transaction.TransactionRepository;
import com.example.finance.transaction.TransactionType;

@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final TransactionRepository transactionRepository;

    public GoalService(GoalRepository goalRepository, TransactionRepository transactionRepository) {
        this.goalRepository = goalRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<GoalResponse> getAll() {
        return goalRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public GoalResponse create(GoalRequest request) {
        validateDates(request.getStartDate(), request.getEndDate());
        Goal goal = new Goal();
        applyRequest(goal, request);
        return toResponse(goalRepository.save(goal));
    }

    @Transactional
    public GoalResponse update(Long id, GoalRequest request) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        validateDates(request.getStartDate(), request.getEndDate());
        applyRequest(goal, request);
        return toResponse(goalRepository.save(goal));
    }

    @Transactional
    public void delete(Long id) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goalRepository.delete(goal);
    }

    private void applyRequest(Goal goal, GoalRequest request) {
        goal.setName(request.getName().trim());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setStartDate(request.getStartDate());
        goal.setEndDate(request.getEndDate());
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null) {
            throw new IllegalArgumentException("Start date is required");
        }
        if (endDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date must be after start date");
        }
    }

    private GoalResponse toResponse(Goal goal) {
        BigDecimal currentAmount = calculateNetSavings(goal.getStartDate(), goal.getEndDate());
        BigDecimal progressPercent = BigDecimal.ZERO;
        if (goal.getTargetAmount() != null && goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            progressPercent = currentAmount
                    .divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .setScale(2, RoundingMode.HALF_UP);
        }
        return new GoalResponse(
                goal.getId(),
                goal.getName(),
                goal.getTargetAmount(),
                goal.getStartDate(),
                goal.getEndDate(),
                currentAmount.setScale(2, RoundingMode.HALF_UP),
                progressPercent);
    }

    private BigDecimal calculateNetSavings(LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions;
        if (endDate != null) {
            transactions = transactionRepository.findByDateBetween(startDate, endDate);
        } else {
            transactions = transactionRepository.findByDateGreaterThanEqual(startDate);
        }

        BigDecimal net = BigDecimal.ZERO;
        for (Transaction transaction : transactions) {
            if (transaction.getType() == TransactionType.INCOME) {
                net = net.add(transaction.getAmount());
            } else {
                net = net.subtract(transaction.getAmount());
            }
        }
        return net;
    }
}
