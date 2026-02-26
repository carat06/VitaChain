package com.example.lifeflow.repository;

import com.example.lifeflow.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UnitRepository extends JpaRepository<Unit, Long> {

    List<Unit> findByBloodGroupAndStatus(String bloodGroup, String status);

    List<Unit> findByHospitalId(Long hospitalId);

    List<Unit> findByStatus(String status);

}