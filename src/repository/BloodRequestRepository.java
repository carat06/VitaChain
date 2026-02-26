package com.example.lifeflow.repository;

import com.example.lifeflow.entity.BloodRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {

    List<BloodRequest> findByHospitalId(Long hospitalId);

    List<BloodRequest> findByStatus(String status);

}