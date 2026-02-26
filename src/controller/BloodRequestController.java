package com.example.lifeflow.controller;

import com.example.lifeflow.entity.BloodRequest;
import com.example.lifeflow.repository.BloodRequestRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/requests")
@CrossOrigin
public class BloodRequestController {

    private final BloodRequestRepository requestRepository;

    // 🔹 Manual Constructor (since no Lombok)
    public BloodRequestController(BloodRequestRepository requestRepository) {
        this.requestRepository = requestRepository;
    }

    @PreAuthorize("hasAuthority('HOSPITAL')")
    @PostMapping
    public BloodRequest createRequest(@RequestBody BloodRequest request) {

        request.setStatus("OPEN");   // ✅ Correct Java
        return requestRepository.save(request);
    }

    @GetMapping
    public List<BloodRequest> getAllRequests() {
        return requestRepository.findAll();
    }
}