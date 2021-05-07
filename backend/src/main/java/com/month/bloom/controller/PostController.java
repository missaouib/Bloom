package com.month.bloom.controller;

import java.net.URI;

import javax.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.month.bloom.model.Comment;
import com.month.bloom.model.Post;
import com.month.bloom.payload.ApiResponse;
import com.month.bloom.payload.CommentRequest;
import com.month.bloom.payload.CommentResponse;
import com.month.bloom.payload.LikeRequest;
import com.month.bloom.payload.LikeResponse;
import com.month.bloom.payload.PagedResponse;
import com.month.bloom.payload.PostRequest;
import com.month.bloom.payload.PostResponse;
import com.month.bloom.payload.UserSummary;
import com.month.bloom.repository.LikeRepository;
import com.month.bloom.repository.PostRepository;
import com.month.bloom.repository.UserRepository;
import com.month.bloom.security.CurrentUser;
import com.month.bloom.security.UserPrincipal;
import com.month.bloom.service.LikeService;
import com.month.bloom.service.PostService;
import com.month.bloom.util.AppConstants;

@RestController
@RequestMapping("/api/posts")
public class PostController {

	@Autowired
	private PostRepository postRepository;
	
	@Autowired
	private LikeRepository likeRepsitory;
	
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private PostService postService;
	
	@Autowired 
	private LikeService likeService;
	
	private static final Logger logger = LoggerFactory.getLogger(PostController.class);

	@GetMapping
	public PagedResponse<PostResponse> getAllPosts(@CurrentUser UserPrincipal currentUser,
            									@RequestParam(value = "page", defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            									@RequestParam(value = "size", defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
		return postService.getAllPosts(currentUser, page, size);
	}
	
	@PostMapping
	@PreAuthorize("hasRole('USER')")
	// MultipartFile can't use JSON data (@RequestBody means use of JSON or XML data with maps your DTO bean) 
	// So Use @ModelAttribute
	public ResponseEntity<?> createPost(@Valid @ModelAttribute PostRequest postReqeust) {
		Post post = postService.createPost(postReqeust);
		
		// Rest API를 구현하는 과정에서 특정값을 포함한 URI를 전달하는 상황
		URI location = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.path("/{postId}")
				.buildAndExpand(post.getId())
				.toUri();
		
		return ResponseEntity.created(location)
				.body(new ApiResponse(true, "Post Created Successfully"));
	}	
	
	@DeleteMapping("{postId}")
	@PreAuthorize("hasRole('USER')")
	public ResponseEntity<?> deletePost(@PathVariable Long postId) {
		postService.deletePost(postId);
		
		return ResponseEntity.created(null)
				.body(new ApiResponse(true, "Post Successfully deleted"));
	}
	
	@PostMapping("/{postId}/likes")
	@PreAuthorize("hasRole('USER')")
	public LikeResponse addLike(@CurrentUser UserPrincipal currentUser, 
								@PathVariable Long postId,		
								@Valid @RequestBody LikeRequest likeRequest) {
		
		
		return likeService.storeLike(postId, currentUser, likeRequest);
		
	}
	
	@DeleteMapping("{postId}/likes")
	@PreAuthorize("hasRole('USER')")
	public ResponseEntity<?> cancelLike(@CurrentUser UserPrincipal currentUser,
										@PathVariable Long postId) {
		if(currentUser != null) {
			likeService.cancelLike(currentUser, postId);
		}
		return ResponseEntity.created(null)
				.body(new ApiResponse(true, "Successfully canceled"));
	}

	// comment
//	@PostMapping("/comments")
//	@PreAuthorize("hasRole('USER')")
//	public ResponseEntity<?> saveComment(@CurrentUser UserPrincipal currentUser, 
//									    @Valid @RequestBody CommentRequest commentRequest) {
//		Comment comment = postService.createComment(currentUser, commentRequest);
//		
//		return ResponseEntity.created(null)
//				.body(new ApiResponse(true, "Comment Successfully registered"));
//	}
	
	@PostMapping("/comments")
	@PreAuthorize("hasRole('USER')")
	public CommentResponse saveComment(@CurrentUser UserPrincipal currentUser, 
									    @Valid @RequestBody CommentRequest commentRequest) {
		Comment comment = postService.createComment(currentUser, commentRequest);
		
		UserSummary userSummary = new UserSummary(comment.getUser().getId(), comment.getUser().getName(), comment.getUser().getUsername());
		
		if(comment.getComment() == null ) {
			CommentResponse commentResponse = new CommentResponse(comment.getId(),
					comment.getText(), userSummary, comment.getCreatedAt(), null);
			return commentResponse;
		}
		CommentResponse commentResponse = new CommentResponse(comment.getId(),
				comment.getText(), userSummary, comment.getCreatedAt(), comment.getComment().getId());
		
		return commentResponse;
	}
}
