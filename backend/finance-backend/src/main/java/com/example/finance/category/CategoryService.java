package com.example.finance.category;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.finance.category.dto.CategoryRequest;
import com.example.finance.category.dto.CategoryResponse;
import com.example.finance.common.ResourceNotFoundException;
import com.example.finance.transaction.TransactionRepository;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public CategoryService(CategoryRepository categoryRepository, TransactionRepository transactionRepository) {
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<CategoryResponse> getAll() {
        return categoryRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        validateUniqueName(request.getName(), null);
        Category category = new Category();
        category.setName(request.getName().trim());
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        validateUniqueName(request.getName(), id);
        category.setName(request.getName().trim());
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        if (transactionRepository.existsByCategoryId(id)) {
            throw new IllegalArgumentException("Category is used by transactions");
        }
        categoryRepository.delete(category);
    }

    private void validateUniqueName(String name, Long currentId) {
        String trimmed = name == null ? "" : name.trim();
        categoryRepository.findByNameIgnoreCase(trimmed).ifPresent(existing -> {
            if (currentId == null || !existing.getId().equals(currentId)) {
                throw new IllegalArgumentException("Category name already exists");
            }
        });
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName());
    }
}
