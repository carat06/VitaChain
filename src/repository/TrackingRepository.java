package com.example.lifeflow.repository;

import com.example.lifeflow.entity.Tracking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrackingRepository extends JpaRepository<Tracking, Long> {

    List<Tracking> findByUnitId(Long unitId);

}