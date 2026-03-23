package com.shop.backend.dto;

public class PlantAnalysisRequestDto {
    private String plantName;
    private String nickname;
    private String plantType;

    public String getPlantName() { return plantName; }
    public void setPlantName(String plantName) { this.plantName = plantName; }
    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }
    public String getPlantType() { return plantType; }
    public void setPlantType(String plantType) { this.plantType = plantType; }
}
