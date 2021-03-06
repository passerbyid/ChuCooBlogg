var index = (function () {
	var _userInfo = null;

	/**
	 * bind event
	 */
	$('#btn-logout').on('click', _handleLogout);
	$('#btn-user').on('click', _handelOpenUserModal);
	$('#btn-updateUser').on('click', _handleUpdateUser);
	$('#btn-createPost').on('click', _handleCreatePost);
	$('#post').on('click', '.btn-more', _handleReadMore);
	
	/**
	 * init
	 */
	_getUserInfo()
		.done(function (data) {
			_userInfo = data.user;
			_renderPost();
		})
		.fail(function () {
			_renderPost();
		});

	function _handleLogout() {
		$.ajax({
			url: `${CONFIG.API_BASE}/logout`, 
			type: 'post', 
			dataType: 'json',
			contentType: 'application/json', 
			success: function (data) {
				console.log(data);
				_userInfo = null;
				alert('Logout.');
				_renderPost();
			}, 
			error: function (jqXHR) {
				if (jqXHR.status == 401) {
					alert('No login');
				}
			}
		});
	}

	function _handelOpenUserModal() {
		if (_userInfo) {
			$('#updateUserUsername').val(_userInfo.username);
			$('#updateUserName').val(_userInfo.name);
			$('#updateUserGender').val(_userInfo.gender);
			$('#updateUserAddress').val(_userInfo.address);
			$('#modal-userInfo').modal();
		} else {
			alert('Login first');
		}
	}

	function _handleUpdateUser() {
		var username = $('#updateUserUsername').val();
		var name = $('#updateUserName').val();
		var gender = $('#updateUserGender').val();
		var address = $('#updateUserAddress').val();
		var password = $('#updateUserPassword').val();
		var data = {
			name, gender, address, password
		};
		$.ajax({
			url: `/authors/${username}`, 
			type: 'patch', 
			dataType: 'json',
			contentType: 'application/json', 
			data: JSON.stringify(data),
			success: function (data) {
				console.log(data);
				localStorage.userData = JSON.stringify(data.user);
				_userInfo = data.user;
				$('#modal-userInfo').modal('hide');
			},
			error: function (jqXHR) {
				console.log(jqXHR);
				if (jqXHR.status == 401) {
					alert('No login');
				}
			}
		})
	}

	function _handleCreatePost() {
		var title = $('#newTitle').val();
		var tags = $('#newTags').val().split(',');
		var content = $('#newContent').val();
		$.ajax({
			url: `${CONFIG.API_BASE}/posts`, 
			type: 'post', 
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				title,
				tags,
				content
			}),
			success: function (data) {
				console.log(data);
				$('#modal-createPost').modal('hide');
				_renderPost();
			},
			error: function (jqXHR) {
				console.log(jqXHR);
				if (jqXHR.status == 401) {
					alert('Login first');
				}
			}
		})
	}

	function _handleReadMore() {
		var id = $(this).data('id');
		$.ajax({
			url: `${CONFIG.API_BASE}/posts/${id}`,
			type: 'post',
			dataType: 'json',
			contentType: 'application/json',
			success: function (data) {
				console.log(data);
				$('#postTitle').text(data.title);
				$('#postTags').html('').append(data.tags.map(function (val, i) {
					return `<span class="badge badge-default mr-1">${_htmlEncode(val)}</span>`;
				}).toString().replace(/,/g, ''));
				$('#postAuthor').text(data.author.name);
				$('#postContent').html(_htmlEncode(data.content).replace(/\n/g, '<br />'));
				$('#postTime').text(moment(post.created_at).format('YYYY/MM/DD HH:mm:ss'));
				$('#modal-postContent').modal();
			},
			error: function (jqXHR) {
				console.log(jqXHR);
			}
		});
	}

	function _getUserInfo() {
		return (
			$.ajax({
				url: `${CONFIG.API_BASE}/authors`,
				type: 'get',
				dataType: 'json',
				contentType: 'application/json',
			})
		);
	}

	function _renderPost() {
		$.ajax({
			url: `${CONFIG.API_BASE}/posts`,
			type: 'get',
			dataType: 'json',
			contentType: 'application/json',
			success: function (data) {
				console.log(data);
				$('#post').html('');
				for (let post of data) {
					$('#post').append(`
						<div class="row mb-2">
							<div class="col-8 offset-2">
								<div class="card post">
									<div class="card-block">
										${_userInfo ? `<span data-id="${post.id}" class="btn-delPost">&times;</span>` : ''}
										<h4 class="card-title">${_htmlEncode(post.title)}</h4>
										<h5 class="card-subtitle mb-2 text-muted">${_htmlEncode(post.author.name)}</h5>
										<h6 class="card-subtitle mb-2 text-muted">${moment(post.created_at).format('YYYY/MM/DD HH:mm:ss')}</h6>
										${post.tags.map(function (val, i) {
											return `<span class="badge badge-default mr-1">${_htmlEncode(val)}</span>`
										}).toString().replace(/,/g, '')}
										<p class="card-text">${_htmlEncode(post.content).replace(/\n/g, '<br />').substring(0, 100)} ...</p>
										<a class="btn-more" data-id="${post.id}" href="javascript:;" class="card-link">Read more...</a>
									</div>
								</div>
							</div>
						</div>
					`)
				}
			},
			error: function (jqXHR) {
				console.log(jqXHR);
			}
		})
	}

	function _htmlEncode(data) {
		return ($('<span>').text(data).html());
	}

})();
