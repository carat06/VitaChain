package com.example.lifeflow.services;

import com.example.lifeflow.entity.Unit;
import com.example.lifeflow.repository.UnitRepository;
import org.springframework.stereotype.Service;

@Service
public class TemperatureService {

    private final UnitRepository unitRepository;

    public TemperatureService(UnitRepository unitRepository) {
        this.unitRepository = unitRepository;
    }

    public Unit logTemperature(Long unitId, double temp) {

        Unit unit = unitRepository.findById(unitId).orElseThrow();

        if (temp < 1 || temp > 6) {
            unit.setStatus("COMPROMISED");
            unit.setTemperatureStatus("BREACH");
        }

        return unitRepository.save(unit);
    }
}