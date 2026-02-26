package com.example.lifeflow.services;

import com.example.lifeflow.entity.Tracking;
import com.example.lifeflow.repository.TrackingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TrackingService {

    private final TrackingRepository trackingRepository;

    // ✅ Constructor Injection
    public TrackingService(TrackingRepository trackingRepository) {
        this.trackingRepository = trackingRepository;
    }

    // 🔹 Save new tracking location
    public Tracking updateLocation(Long unitId,
                                   double latitude,
                                   double longitude,
                                   String status) {

        Tracking tracking = new Tracking();

        tracking.setUnitId(unitId);
        tracking.setLatitude(latitude);
        tracking.setLongitude(longitude);
        tracking.setStatus(status);
        tracking.setUpdatedAt(LocalDateTime.now().toString());

        return trackingRepository.save(tracking);
    }

    // 🔹 Get tracking history for a unit
    public List<Tracking> getTrackingHistory(Long unitId) {
        return trackingRepository.findByUnitId(unitId);
    }
}