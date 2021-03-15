const BASE_URL = "https://jsonplace-univclone.herokuapp.com";

//when we want to get all of the users, for example, we can build our URL this way: `${ BASE_URL }/users`

function fetchData(url) {
  return fetch(url)
    .then(function (response) {
      return response.json();
    })
    .catch(function (error) {
      console.error(error);
    });
}

function fetchUsers() {
  return fetch(`${BASE_URL}/users`)
    .then(function (response) {
      console.log(response);
      // call json on the response, and return the result
      return response.json();
    })
    .catch(function (error) {
      // use console.error to log out any error
      console.log(error);
    });
}

function renderUser(user) {
  return $(`
    <div class="user-card">
  <header>
    <h2>${user.name}</h2>
  </header>
  <section class="company-info">
    <p><b>Contact:</b> ${user.email}</p>
    <p><b>Works for:</b> ${user.company.name}</p>
    <p><b>Company creed:</b> "${user.company.catchPhrase}, ${user.company.bs}!"</p>
  </section>
  <footer>
    <button class="load-posts">POSTS BY ${user.username}</button>
    <button class="load-albums">ALBUMS BY ${user.username}</button>
  </footer>
</div>
`).data("user", user);
}

function renderUserList(userList) {
  $("#user-list").empty();
  userList.forEach(function (user) {
    $("#user-list").append(renderUser(user));
  });
}

/* get an album list, or an array of albums */
function fetchUserAlbumList(userId) {
  return fetch(`${BASE_URL}/users/${userId}/albums?_expand=user&_embed=photos`)
    .then(function (response) {
      // convert from JSON to an object, and return
      return response.json();
    })
    .catch(function (error) {
      // console.error out the error
      console.error(error);
    });
}

/* render a single album */
function renderAlbum(album) {
  $(".photo-list").empty();

  let albumCard = $(`
    <div class="album-card">
      <header>
        <h3>${album.title}, by ${album.user.username} </h3>
      </header>
    <section class="photo-list"></section>
  </div>
  `);

  album.photos.forEach(function (photo) {
    $(".photo-list").append(renderPhoto(photo));
  });
  return albumCard;
}

/* render a single photo */
function renderPhoto(photo) {
  let photoCard = $(`
    <div class="photo-card">
      <a href="${photo.url}" target="_blank">
      <img src="${photo.thumbnailUrl}">
      <figure>${photo.title}</figure>
    </a>
    </div>
  `);
  return photoCard;
}

/* render an array of albums */
function renderAlbumList(albumList) {
  $("#app section.active").removeClass("active");
  $("#album-list").empty().addClass("active");
  albumList.forEach(function (album) {
    $("#album-list").append(renderAlbum(album));
  });
}

$("#user-list").on("click", ".user-card .load-albums", function () {
  // load albums for this user
  // render albums for this user
  const userData = $(this).closest(".user-card").data("user");
  fetchUserAlbumList(userData.id).then(renderAlbumList);
});


function fetchUserPosts(userId) {
  return fetchData(`${BASE_URL}/users/${userId}/posts?_expand=user`);
}

function fetchPostComments(postId) {
  return fetchData(`${BASE_URL}/posts/${postId}/comments`);
}
function setCommentsOnPost(post) {
  // post.comments might be undefined, or an []
  // if undefined, fetch them then set the result
  // if defined, return a rejected promise

  // if we already have comments, don't fetch them again
  if (post.comments) {
    return Promise.reject(null);
  }

  // fetch, upgrade the post object, then return it
  return fetchPostComments(post.id).then(function (comments) {
    post.comments = comments;
    return post;
  });
}

function renderPost(post) {
  return $(`
<div class="post-card">
  <header>
    <h3>${post.title}</h3>
    <h3>--- ${post.user.username}</h3>
  </header>
  <p>${post.body}</p>
  <footer>
    <div class="comment-list"></div>
    <a href="#" class="toggle-comments">(<span class="verb">show</span> comments)</a>
  </footer>
</div>
`).data("post", post);
}

function renderPostList(postList) {
  $("#app section.active").removeClass("active");

  $("#post-list").empty().addClass("active");

  postList.forEach(function (post) {
    $("#post-list").append(renderPost(post));
  });
}

function toggleComments(postCardElement) {
  const footerElement = postCardElement.find("footer");

  if (footerElement.hasClass("comments-open")) {
    footerElement.removeClass("comments-open");
    footerElement.find(".verb").text("show");
  } else {
    footerElement.addClass("comments-open");
    footerElement.find(".verb").text("hide");
  }
}

$("#user-list").on("click", ".user-card .load-posts", function () {
  // load posts for this user
  // render posts for this user
  const userData = $(this).closest(".user-card").data('user');
  fetchUserPosts(userData.id).then(renderPostList);
});

$("#post-list").on("click", ".post-card .toggle-comments", function () {
  const postCardElement = $(this).closest(".post-card");
  const post = postCardElement.data("post");
  const commentListEl = postCardElement.find(".comment-list");

  setCommentsOnPost(post)
    .then(function (post) {
      console.log("building comments for the first time...");

      commentListEl.empty();
      post.comments.forEach(function (comment) {
        commentListEl.prepend(
          $(`
        <h3>${comment.body} --- ${comment.email}</h3>
        `)
        );
      });
      toggleComments(postCardElement);
    })
    .catch(function () {
      console.log("comments previously existed, only toggling...");

      toggleComments(postCardElement);
    });
});

function bootstrap() {
  fetchUsers().then(function (data) {
    renderUserList(data);
  });

  //fetchUsers().then(renderUserList); -- same as lines 51-55
}

bootstrap();
