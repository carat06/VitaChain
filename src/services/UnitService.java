package com.example.lifeflow.services;

import com.example.lifeflow.entity.Unit;
import com.example.lifeflow.repository.UnitRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UnitService {

    private final UnitRepository unitRepository;

    public UnitService(UnitRepository unitRepository) {
        this.unitRepository = unitRepository;
    }

    public Unit createUnit(Unit unit) {

        unit.setStatus("COLLECTED");
        unit.setTemperatureStatus("SAFE");

        return unitRepository.save(unit);
    }

    public Unit approveUnit(Long id) {

        Unit unit = unitRepository.findById(id).orElseThrow();
        unit.setStatus("STORED");

        return unitRepository.save(unit);
    }

    public Unit dispatchUnit(Long id) {

        Unit unit = unitRepository.findById(id).orElseThrow();
        unit.setStatus("IN_TRANSIT");

        return unitRepository.save(unit);
    }

    public Unit receiveUnit(Long id) {

        Unit unit = unitRepository.findById(id).orElseThrow();
        unit.setStatus("RECEIVED");

        return unitRepository.save(unit);
    }

    public List<Unit> getAllUnits() {
        return unitRepository.findAll();
    }
}