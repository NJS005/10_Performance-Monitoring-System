package com.performance.Monitoring.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import com.performance.Monitoring.Repo.DailyAttendanceRepo;

@Service
public class DailyAttendanceCleanupTask {

    @Autowired
    private DailyAttendanceRepo dailyAttendanceRepo;

    // Run at exactly 00:00:00 every day
    @Scheduled(cron = "0 0 0 * * ?")
    public void wipeDailyAttendance() {
        System.out.println("Executing Midnight Cleanup: Wiping DailyAttendance table.");
        dailyAttendanceRepo.deleteAllInBatch();
    }
}
