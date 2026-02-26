package com.example.lifeflow.services;

import com.example.lifeflow.entity.BloodRequest;
import com.example.lifeflow.repository.BloodRequestRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BloodRequestService {

    private final BloodRequestRepository requestRepository;

    public BloodRequestService(BloodRequestRepository requestRepository) {
        this.requestRepository = requestRepository;
    }

    public BloodRequest createRequest(BloodRequest request) {

        request.setStatus("OPEN");
        return requestRepository.save(request);
    }

    public List<BloodRequest> getAllRequests() {
        return requestRepository.findAll();
    }
}