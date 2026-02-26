package com.example.lifeflow.services;

import com.example.lifeflow.entity.BloodRequest;
import com.example.lifeflow.entity.Unit;
import com.example.lifeflow.repository.BloodRequestRepository;
import com.example.lifeflow.repository.UnitRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MatchingService {

    private final UnitRepository unitRepository;
    private final BloodRequestRepository requestRepository;

    public MatchingService(UnitRepository unitRepository,
                           BloodRequestRepository requestRepository) {
        this.unitRepository = unitRepository;
        this.requestRepository = requestRepository;
    }

    public void match(Long requestId) {

        BloodRequest request =
                requestRepository.findById(requestId).orElseThrow();

        List<Unit> availableUnits =
                unitRepository.findByBloodGroupAndStatus(
                        request.getBloodGroup(), "STORED");

        if (!availableUnits.isEmpty()) {

            Unit unit = availableUnits.get(0);
            unit.setStatus("MATCHED");
            unit.setHospitalId(request.getHospitalId());
            unitRepository.save(unit);

            request.setStatus("MATCHED");
            requestRepository.save(request);
        }
    }
}