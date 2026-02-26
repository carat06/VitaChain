package com.example.lifeflow.controller;

import com.example.lifeflow.entity.Unit;
import com.example.lifeflow.repository.UnitRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/temperature")
@CrossOrigin
public class TemperatureController {

    private final UnitRepository unitRepository;

    public TemperatureController(UnitRepository unitRepository) {
        this.unitRepository = unitRepository;
    }

    @PostMapping("/{unitId}")
    public Unit logTemperature(@PathVariable Long unitId,
                               @RequestParam double temp) {

        Unit unit = unitRepository.findById(unitId).orElseThrow();

        if (temp < 1 || temp > 6) {
            unit.setStatus("COMPROMISED");
            unit.setTemperatureStatus("BREACH");
        }

        return unitRepository.save(unit);
    }
}