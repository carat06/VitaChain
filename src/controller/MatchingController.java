package com.example.lifeflow.controller;

import com.example.lifeflow.services.MatchingService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/match")
@CrossOrigin
public class MatchingController {

    private final MatchingService matchingService;

    public MatchingController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @PreAuthorize("hasAuthority('COLLECTION')")
    @PostMapping("/{requestId}")
    public String matchRequest(@PathVariable Long requestId) {

        matchingService.match(requestId);
        return "Matching executed successfully";
    }
}