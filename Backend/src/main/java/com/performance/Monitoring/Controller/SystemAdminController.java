package com.performance.Monitoring.Controller;

import com.performance.Monitoring.Modal.*;
import com.performance.Monitoring.Repo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class SystemAdminController {

    @Autowired private StudentRepo studentRepo;
    @Autowired private DepartmentRepo departmentRepo;
    @Autowired private CoursesRepo coursesRepo;
    @Autowired private CourseCatalogRepo courseCatalogRepo;
    @Autowired private AttendaceRepo attendanceRepo;
    @Autowired private DailyAttendanceRepo dailyAttendanceRepo;
    @Autowired private CoRepo coCurricularRepo;
    @Autowired private CourseVerificationRepo courseVerificationRepo;
    @Autowired private FacultyRepo facultyRepo;
    @Autowired private UserRepo userRepo;

    // ----- FACULTY -----
    @GetMapping("/faculty")
    public ResponseEntity<List<Faculty>> getAllFaculty() {
        return ResponseEntity.ok(facultyRepo.findAll());
    }

    @PostMapping("/faculty")
    public ResponseEntity<?> createFaculty(@RequestBody java.util.Map<String, Object> payload) {
        String email = (String) payload.get("email");
        String name = (String) payload.get("name");

        if (userRepo.findByEmail(email).isEmpty()) {
            User newUser = new User();
            newUser.setName(name);
            newUser.setEmail(email);
            newUser.setRole("Faculty Advisor");
            userRepo.save(newUser);
        }

        Faculty faculty = new Faculty();
        faculty.setName(name);
        faculty.setEmail(email);
        if (payload.containsKey("department")) {
            Department d = departmentRepo.findByCodeIgnoreCase((String) payload.get("department"));
            faculty.setDepartment(d);
        }
        if (payload.containsKey("designation")) {
            faculty.setDesignation((String) payload.get("designation"));
        }
        if (payload.containsKey("contactNo") && payload.get("contactNo") != null && !payload.get("contactNo").toString().isEmpty()) {
            faculty.setContactNo(Long.parseLong(payload.get("contactNo").toString()));
        }
        return ResponseEntity.ok(facultyRepo.save(faculty));
    }

    @PutMapping("/faculty/{id}")
    public ResponseEntity<?> updateFaculty(@PathVariable Long id, @RequestBody java.util.Map<String, Object> payload) {
        Optional<Faculty> opt = facultyRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Faculty faculty = opt.get();
        String oldEmail = faculty.getEmail();
        
        String email = (String) payload.get("email");
        String name = (String) payload.get("name");
        faculty.setName(name);
        faculty.setEmail(email);

        if (payload.containsKey("department")) {
            Department d = departmentRepo.findByCodeIgnoreCase((String) payload.get("department"));
            faculty.setDepartment(d);
        }
        if (payload.containsKey("designation")) {
            faculty.setDesignation((String) payload.get("designation"));
        }
        if (payload.containsKey("contactNo") && payload.get("contactNo") != null && !payload.get("contactNo").toString().isEmpty()) {
            faculty.setContactNo(Long.parseLong(payload.get("contactNo").toString()));
        }

        // Also update User table
        Optional<User> userOpt = userRepo.findByEmail(oldEmail);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setName(name);
            user.setEmail(email);
            userRepo.save(user);
        }

        return ResponseEntity.ok(facultyRepo.save(faculty));
    }

    @DeleteMapping("/faculty/{id}")
    public ResponseEntity<Void> deleteFaculty(@PathVariable Long id) {
        Optional<Faculty> opt = facultyRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        
        // Also delete from User table
        userRepo.findByEmail(opt.get().getEmail()).ifPresent(u -> userRepo.delete(u));
        
        facultyRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ----- STUDENTS -----
    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentRepo.findAll());
    }

    @PostMapping("/students")
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        String faName = student.getFacultyAdvisorTemp();
        if (faName != null && !faName.trim().isEmpty()) {
            List<Faculty> faculties = facultyRepo.findByNameIgnoreCase(faName.trim());
            if (!faculties.isEmpty()) {
                student.setFacultyAdvisorEntity(faculties.get(0));
                student.setFacultyAdvisorTemp(null);
            }
        }
        return ResponseEntity.ok(studentRepo.save(student));
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable String id, @RequestBody Student payload) {
        Optional<Student> opt = studentRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        
        Student existing = opt.get();
        if (payload.getName() != null) existing.setName(payload.getName());
        if (payload.getDepartment() != null) existing.setDepartment(payload.getDepartment());
        if (payload.getBatch() != 0) existing.setBatch(payload.getBatch());
        if (payload.getContactNo() != null && payload.getContactNo() != 0) existing.setContactNo(payload.getContactNo());

        String faName = payload.getFacultyAdvisorTemp();
        if (faName != null) {
            if (faName.trim().isEmpty()) {
                existing.setFacultyAdvisorEntity(null);
                existing.setFacultyAdvisorTemp(null);
            } else {
                List<Faculty> faculties = facultyRepo.findByNameIgnoreCase(faName.trim());
                if (!faculties.isEmpty()) {
                    existing.setFacultyAdvisorEntity(faculties.get(0));
                    existing.setFacultyAdvisorTemp(null);
                } else {
                    existing.setFacultyAdvisorTemp(faName);
                    existing.setFacultyAdvisorEntity(null);
                }
            }
        }

        return ResponseEntity.ok(studentRepo.save(existing));
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable String id) {
        if (!studentRepo.existsById(id)) return ResponseEntity.notFound().build();
        studentRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ----- DEPARTMENTS -----
    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentRepo.findAll());
    }

    @PostMapping("/departments")
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        return ResponseEntity.ok(departmentRepo.save(department));
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<Department> updateDepartment(@PathVariable Long id, @RequestBody Department department) {
        if (!departmentRepo.existsById(id)) return ResponseEntity.notFound().build();
        department.setId(id);
        return ResponseEntity.ok(departmentRepo.save(department));
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        if (!departmentRepo.existsById(id)) return ResponseEntity.notFound().build();
        departmentRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ----- COURSES -----
    @GetMapping("/courses")
    public ResponseEntity<List<Courses>> getAllCourses() {
        return ResponseEntity.ok(coursesRepo.findAll());
    }

    @PostMapping("/courses")
    public ResponseEntity<Courses> createCourse(@RequestBody Courses course) {
        return ResponseEntity.ok(coursesRepo.save(course));
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<Courses> updateCourse(@PathVariable Long id, @RequestBody Courses course) {
        if (!coursesRepo.existsById(id)) return ResponseEntity.notFound().build();
        course.setId(id);
        return ResponseEntity.ok(coursesRepo.save(course));
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        if (!coursesRepo.existsById(id)) return ResponseEntity.notFound().build();
        coursesRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ----- COURSE CATALOG -----
    @GetMapping("/coursecatalog")
    public ResponseEntity<List<CourseCatalog>> getAllCourseCatalog() {
        return ResponseEntity.ok(courseCatalogRepo.findAll());
    }

    @PostMapping("/coursecatalog")
    public ResponseEntity<CourseCatalog> createCourseCatalog(@RequestBody CourseCatalog catalog) {
        return ResponseEntity.ok(courseCatalogRepo.save(catalog));
    }

    @PutMapping("/coursecatalog/{id}")
    public ResponseEntity<CourseCatalog> updateCourseCatalog(@PathVariable String id, @RequestBody CourseCatalog catalog) {
        if (!courseCatalogRepo.existsById(id)) return ResponseEntity.notFound().build();
        catalog.setCourseCode(id);
        return ResponseEntity.ok(courseCatalogRepo.save(catalog));
    }

    @DeleteMapping("/coursecatalog/{id}")
    public ResponseEntity<Void> deleteCourseCatalog(@PathVariable String id) {
        if (!courseCatalogRepo.existsById(id)) return ResponseEntity.notFound().build();
        courseCatalogRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ----- ATTENDANCE -----
    @GetMapping("/attendance")
    public ResponseEntity<List<Attendance>> getAllAttendance() {
        return ResponseEntity.ok(attendanceRepo.findAll());
    }

    @PostMapping("/attendance")
    public ResponseEntity<Attendance> createAttendance(@RequestBody Attendance attendance) {
        return ResponseEntity.ok(attendanceRepo.save(attendance));
    }

    @PutMapping("/attendance/{id}")
    public ResponseEntity<Attendance> updateAttendance(@PathVariable Long id, @RequestBody Attendance attendance) {
        if (!attendanceRepo.existsById(id)) return ResponseEntity.notFound().build();
        attendance.setId(id);
        return ResponseEntity.ok(attendanceRepo.save(attendance));
    }

    @DeleteMapping("/attendance/{id}")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {
        if (!attendanceRepo.existsById(id)) return ResponseEntity.notFound().build();
        attendanceRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ----- DAILY ATTENDANCE -----
    @GetMapping("/dailyattendance")
    public ResponseEntity<List<DailyAttendance>> getAllDailyAttendance() {
        return ResponseEntity.ok(dailyAttendanceRepo.findAll());
    }

    @PostMapping("/dailyattendance")
    public ResponseEntity<DailyAttendance> createDailyAttendance(@RequestBody DailyAttendance dailyAttendance) {
        return ResponseEntity.ok(dailyAttendanceRepo.save(dailyAttendance));
    }

    @PutMapping("/dailyattendance/{id}")
    public ResponseEntity<DailyAttendance> updateDailyAttendance(@PathVariable Long id, @RequestBody DailyAttendance dailyAttendance) {
        if (!dailyAttendanceRepo.existsById(id)) return ResponseEntity.notFound().build();
        dailyAttendance.setId(id);
        return ResponseEntity.ok(dailyAttendanceRepo.save(dailyAttendance));
    }

    @DeleteMapping("/dailyattendance/{id}")
    public ResponseEntity<Void> deleteDailyAttendance(@PathVariable Long id) {
        if (!dailyAttendanceRepo.existsById(id)) return ResponseEntity.notFound().build();
        dailyAttendanceRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ----- CO-CURRICULAR -----
    @GetMapping("/cocurricular")
    public ResponseEntity<List<CoCurricular>> getAllCoCurricular() {
        return ResponseEntity.ok(coCurricularRepo.findAll());
    }

    @PostMapping("/cocurricular")
    public ResponseEntity<CoCurricular> createCoCurricular(@RequestBody CoCurricular coCurricular) {
        return ResponseEntity.ok(coCurricularRepo.save(coCurricular));
    }

    @PutMapping("/cocurricular/{id}")
    public ResponseEntity<CoCurricular> updateCoCurricular(@PathVariable Long id, @RequestBody CoCurricular coCurricular) {
        if (!coCurricularRepo.existsById(id)) return ResponseEntity.notFound().build();
        coCurricular.setIdd(id); // ID uses idd in this table
        return ResponseEntity.ok(coCurricularRepo.save(coCurricular));
    }

    @DeleteMapping("/cocurricular/{id}")
    public ResponseEntity<Void> deleteCoCurricular(@PathVariable Long id) {
        if (!coCurricularRepo.existsById(id)) return ResponseEntity.notFound().build();
        coCurricularRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ----- COURSE VERIFICATION -----
    @GetMapping("/courseverification")
    public ResponseEntity<List<CourseVerification>> getAllCourseVerification() {
        return ResponseEntity.ok(courseVerificationRepo.findAll());
    }

    @PostMapping("/courseverification")
    public ResponseEntity<CourseVerification> createCourseVerification(@RequestBody CourseVerification verification) {
        return ResponseEntity.ok(courseVerificationRepo.save(verification));
    }

    @PutMapping("/courseverification/{id}")
    public ResponseEntity<CourseVerification> updateCourseVerification(@PathVariable Long id, @RequestBody CourseVerification verification) {
        if (!courseVerificationRepo.existsById(id)) return ResponseEntity.notFound().build();
        verification.setId(id);
        return ResponseEntity.ok(courseVerificationRepo.save(verification));
    }

    @DeleteMapping("/courseverification/{id}")
    public ResponseEntity<Void> deleteCourseVerification(@PathVariable Long id) {
        if (!courseVerificationRepo.existsById(id)) return ResponseEntity.notFound().build();
        courseVerificationRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
