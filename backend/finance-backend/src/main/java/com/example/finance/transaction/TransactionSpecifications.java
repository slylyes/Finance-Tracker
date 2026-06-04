package com.example.finance.transaction;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;

public final class TransactionSpecifications {

    private TransactionSpecifications() {
    }

    public static Specification<Transaction> withFilters(TransactionFilter filter) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getStartDate() != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("date"), filter.getStartDate()));
            }
            if (filter.getEndDate() != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("date"), filter.getEndDate()));
            }
            if (filter.getMinAmount() != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("amount"), filter.getMinAmount()));
            }
            if (filter.getMaxAmount() != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("amount"), filter.getMaxAmount()));
            }
            if (filter.getCategoryId() != null) {
                predicates.add(builder.equal(root.get("category").get("id"), filter.getCategoryId()));
            }
            if (filter.getType() != null) {
                predicates.add(builder.equal(root.get("type"), filter.getType()));
            }
            if (filter.getQuery() != null && !filter.getQuery().isBlank()) {
                String like = "%" + filter.getQuery().toLowerCase() + "%";
                predicates.add(builder.like(builder.lower(root.get("description")), like));
            }

            query.orderBy(builder.desc(root.get("date")), builder.desc(root.get("id")));
            return builder.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Transaction> dateBetween(LocalDate startDate, LocalDate endDate) {
        return (root, query, builder) -> {
            if (startDate == null && endDate == null) {
                return builder.conjunction();
            }
            if (startDate != null && endDate != null) {
                return builder.between(root.get("date"), startDate, endDate);
            }
            if (startDate != null) {
                return builder.greaterThanOrEqualTo(root.get("date"), startDate);
            }
            return builder.lessThanOrEqualTo(root.get("date"), endDate);
        };
    }
}
