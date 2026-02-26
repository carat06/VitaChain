package com.example.lifeflow.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tracking")
@CrossOrigin
public class TrackingController {

    @PostMapping("/{unitId}")
    public String updateLocation(@PathVariable Long unitId,
                                 @RequestParam double lat,
                                 @RequestParam double lng) {

        return "Location updated for unit " + unitId +
                " -> Lat: " + lat + ", Lng: " + lng;
    }
}