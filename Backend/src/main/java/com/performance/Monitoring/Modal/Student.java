package com.performance.Monitoring.Modal;

import jakarta.persistence.*;
@Entity
@Table(name = "Student")

public class Student {

        @Id

        private String Rollno;

        @Column(nullable = false)
        private String name;
        private String dept;
        private String prog;
        private int batch;
        private int batchtype;
        private boolean verification_status;
        private boolean PVS;
        private String email;
        private String Mothername;
        private String Fathername;
        private String FA;






}
