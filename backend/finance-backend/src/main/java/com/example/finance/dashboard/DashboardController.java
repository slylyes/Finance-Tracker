package com.example.finance.dashboard;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.finance.dashboard.dto.CategoryTotal;
import com.example.finance.dashboard.dto.DashboardOverview;
import com.example.finance.dashboard.dto.MonthlyTotal;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/overview")
    public DashboardOverview getOverview(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        LocalDate[] range = normalizeRange(startDate, endDate);
        return dashboardService.getOverview(range[0], range[1]);
    }

    @GetMapping("/monthly-expenses")
    public List<MonthlyTotal> getMonthlyExpenses(@RequestParam(required = false) Integer year) {
        int targetYear = year != null ? year : LocalDate.now().getYear();
        return dashboardService.getMonthlyExpenses(targetYear);
    }

    @GetMapping("/expenses-by-category")
    public List<CategoryTotal> getExpensesByCategory(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        LocalDate[] range = normalizeRange(startDate, endDate);
        return dashboardService.getExpenseByCategory(range[0], range[1]);
    }

    private LocalDate[] normalizeRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null && endDate == null) {
            LocalDate now = LocalDate.now();
            return new LocalDate[] { now.withDayOfMonth(1), now };
        }
        if (startDate == null) {
            return new LocalDate[] { endDate.withDayOfMonth(1), endDate };
        }
        if (endDate == null) {
            return new LocalDate[] { startDate, LocalDate.now() };
        }
        return new LocalDate[] { startDate, endDate };
    }
}
