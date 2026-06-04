package com.example.finance.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.finance.category.Category;
import com.example.finance.dashboard.dto.CategoryTotal;
import com.example.finance.dashboard.dto.DashboardOverview;
import com.example.finance.dashboard.dto.MonthlyTotal;
import com.example.finance.transaction.Transaction;
import com.example.finance.transaction.TransactionRepository;
import com.example.finance.transaction.TransactionSpecifications;
import com.example.finance.transaction.TransactionType;

@Service
public class DashboardService {

    private final TransactionRepository transactionRepository;

    public DashboardService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public DashboardOverview getOverview(LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepository.findAll(
                TransactionSpecifications.dateBetween(startDate, endDate));

        BigDecimal income = BigDecimal.ZERO;
        BigDecimal expense = BigDecimal.ZERO;
        for (Transaction transaction : transactions) {
            if (transaction.getType() == TransactionType.INCOME) {
                income = income.add(transaction.getAmount());
            } else {
                expense = expense.add(transaction.getAmount());
            }
        }
        BigDecimal net = income.subtract(expense);
        return new DashboardOverview(income, expense, net);
    }

    public List<MonthlyTotal> getMonthlyExpenses(int year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);
        List<Transaction> transactions = transactionRepository.findAll(
                TransactionSpecifications.dateBetween(startDate, endDate));

        Map<Integer, BigDecimal> totals = new LinkedHashMap<>();
        for (int month = 1; month <= 12; month++) {
            totals.put(month, BigDecimal.ZERO);
        }

        for (Transaction transaction : transactions) {
            if (transaction.getType() == TransactionType.EXPENSE) {
                int month = transaction.getDate().getMonthValue();
                totals.put(month, totals.get(month).add(transaction.getAmount()));
            }
        }

        List<MonthlyTotal> response = new ArrayList<>();
        for (Map.Entry<Integer, BigDecimal> entry : totals.entrySet()) {
            response.add(new MonthlyTotal(entry.getKey(), entry.getValue()));
        }
        return response;
    }

    public List<CategoryTotal> getExpenseByCategory(LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepository.findAll(
                TransactionSpecifications.dateBetween(startDate, endDate));

        Map<Long, CategoryTotal> totals = new LinkedHashMap<>();
        for (Transaction transaction : transactions) {
            if (transaction.getType() != TransactionType.EXPENSE) {
                continue;
            }
            Category category = transaction.getCategory();
            CategoryTotal total = totals.computeIfAbsent(category.getId(),
                    id -> new CategoryTotal(id, category.getName(), BigDecimal.ZERO));
            total.setTotalExpense(total.getTotalExpense().add(transaction.getAmount()));
        }

        return new ArrayList<>(totals.values());
    }
}
