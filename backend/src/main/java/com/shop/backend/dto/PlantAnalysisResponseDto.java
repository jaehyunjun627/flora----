package com.shop.backend.dto;

public class PlantAnalysisResponseDto {
    private Integer wateringInterval;
    private Integer repottingInterval;
    private Integer fertilizingInterval;
    private Integer pruningInterval;
    private String careNotes;

    public Integer getWateringInterval() { return wateringInterval; }
    public void setWateringInterval(Integer wateringInterval) { this.wateringInterval = wateringInterval; }
    public Integer getRepottingInterval() { return repottingInterval; }
    public void setRepottingInterval(Integer repottingInterval) { this.repottingInterval = repottingInterval; }
    public Integer getFertilizingInterval() { return fertilizingInterval; }
    public void setFertilizingInterval(Integer fertilizingInterval) { this.fertilizingInterval = fertilizingInterval; }
    public Integer getPruningInterval() { return pruningInterval; }
    public void setPruningInterval(Integer pruningInterval) { this.pruningInterval = pruningInterval; }
    public String getCareNotes() { return careNotes; }
    public void setCareNotes(String careNotes) { this.careNotes = careNotes; }
}
