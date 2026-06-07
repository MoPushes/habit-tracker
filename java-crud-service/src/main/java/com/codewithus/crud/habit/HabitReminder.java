package com.codewithus.crud.habit;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Per-habit reminder. JSON shape on the wire:
 *
 *   { "time": "09:00", "freq": "daily" | "weekdays" | "weekends" | "custom", "days": [0..6] }
 *
 * Persisted as three columns on the `habit` table via @Embedded; `days` is stored
 * as a small CSV so we don't need a vendor-specific JSON column type or a join table.
 */
@Embeddable
public class HabitReminder {

    @Column(name = "reminder_clock", length = 8)
    private String time;

    @Column(name = "reminder_freq", length = 16)
    private String freq;

    @Column(name = "reminder_days", length = 32)
    private String daysCsv;

    public HabitReminder() {}

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getFreq() { return freq; }
    public void setFreq(String freq) { this.freq = freq; }

    // Kept out of JSON; only used by JPA to round-trip the column.
    @JsonIgnore
    public String getDaysCsv() { return daysCsv; }
    @JsonIgnore
    public void setDaysCsv(String daysCsv) { this.daysCsv = daysCsv; }

    @JsonProperty("days")
    public List<Integer> getDays() {
        if (daysCsv == null || daysCsv.isEmpty()) return Collections.emptyList();
        return Arrays.stream(daysCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Integer::parseInt)
                .collect(Collectors.toList());
    }

    @JsonProperty("days")
    public void setDays(List<Integer> days) {
        if (days == null || days.isEmpty()) {
            this.daysCsv = "";
        } else {
            this.daysCsv = days.stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(","));
        }
    }
}
