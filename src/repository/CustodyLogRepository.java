package com.example.lifeflow.repository;

import com.example.lifeflow.entity.CustodyLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustodyLogRepository extends JpaRepository<CustodyLog, Long> {

    List<CustodyLog> findByUnitId(Long unitId);

}