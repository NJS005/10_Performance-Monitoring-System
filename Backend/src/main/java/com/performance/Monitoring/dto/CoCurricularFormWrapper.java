package com.performance.Monitoring.dto;
import java.util.List;
// import com.performance.Monitoring.Modal.CoCurricular;

public class CoCurricularFormWrapper {
    private List<CoCurricularDTO> activities;

    public List<CoCurricularDTO> getActivities() { return activities; }
    public void setActivities(List<CoCurricularDTO> activities) { this.activities = activities; }
}