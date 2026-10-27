package com.emotioncare.api.domain.emotion.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "emotion_tags")
public class EmotionTagEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name = "name", nullable = false, unique = true, length = 100)
  private String name;

  @Column(name = "category_id", nullable = false)
  private Short categoryId;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "icon", nullable = false, columnDefinition = "jsonb")
  private IconSnapshot icon;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "sub_icon", nullable = false, columnDefinition = "jsonb")
  private IconSnapshot subIcon;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id", insertable = false, updatable = false)
  private EmotionCategoryEntity category;

  @Getter
  @Setter
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class IconSnapshot implements Serializable {
    private String key;
    private String color;
    private String bgColor;
    private String icon;
  }
}
