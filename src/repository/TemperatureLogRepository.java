package com.example.lifeflow.repository;

import com.example.lifeflow.entity.TemperatureLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TemperatureLogRepository extends JpaRepository<TemperatureLog, Long> {

    List<TemperatureLog> findByUnitId(Long unitId);

}