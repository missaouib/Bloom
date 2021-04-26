package com.month.bloom.model;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.springframework.web.multipart.MultipartFile;

import com.month.bloom.model.audit.UserDateAudit;

@Entity
@Table(name="posts")
public class Post extends UserDateAudit {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@NotBlank
	@Size(max = 140)
	private String content;

	@OneToMany(
			mappedBy="post",
			cascade = CascadeType.ALL,
			fetch = FetchType.EAGER,
			orphanRemoval = true)
    @Fetch(FetchMode.SELECT)
    @BatchSize(size = 30)
    private List<Image> images = new ArrayList<>();

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

//	public List<Image> getImages() {
//		return images;
//	}
//
//	public void setImages(List<Image> images) {
//		this.images = images;
//	}
		
//	public List<MultipartFile> getImages() {
//		return images;
//	}
//
//	public void setImages(List<MultipartFile> images) {
//		this.images = images;
//	}

	public void addImage(Image image) {
		images.add(image);
		image.setPost(this);
	}
	
//	public void addImage(Image image) {
//		images.add((MultipartFile) image);
//		image.setPost(this);
//	}	
	
	public void removeImage(Image image) {
		images.remove(image);
		image.setPost(this);
	}

}
