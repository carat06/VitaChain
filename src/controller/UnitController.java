package com.example.lifeflow.controller;

import com.example.lifeflow.entity.Unit;
import com.example.lifeflow.repository.UnitRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/units")
@CrossOrigin
public class UnitController {

    private final UnitRepository unitRepository;

    public UnitController(UnitRepository unitRepository) {
        this.unitRepository = unitRepository;
    }

    @PreAuthorize("hasAuthority('COLLECTION')")
    @PostMapping
    public Unit createUnit(@RequestBody Unit unit) {

        unit.setStatus("COLLECTED");
        unit.setTemperatureStatus("SAFE");

        return unitRepository.save(unit);
    }

    @PreAuthorize("hasAuthority('COLLECTION')")
    @PutMapping("/{id}/approve")
    public Unit approveUnit(@PathVariable Long id) {

        Unit unit = unitRepository.findById(id).orElseThrow();
        unit.setStatus("STORED");

        return unitRepository.save(unit);
    }

    @PreAuthorize("hasAuthority('COLLECTION')")
    @PutMapping("/{id}/dispatch")
    public Unit dispatchUnit(@PathVariable Long id) {

        Unit unit = unitRepository.findById(id).orElseThrow();
        unit.setStatus("IN_TRANSIT");

        return unitRepository.save(unit);
    }

    @PreAuthorize("hasAuthority('HOSPITAL')")
    @PutMapping("/{id}/receive")
    public Unit receiveUnit(@PathVariable Long id) {

        Unit unit = unitRepository.findById(id).orElseThrow();
        unit.setStatus("RECEIVED");

        return unitRepository.save(unit);
    }

    @GetMapping
    public List<Unit> getAllUnits() {
        return unitRepository.findAll();
    }
}