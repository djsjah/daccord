export async function getUserAuthData() {
  return (
    await fetch('http://localhost:5000/auth/payload')
  );
}

export async function signin(authData) {
  return (
    await fetch('http://localhost:5000/auth/signin', {
      method: 'POST',
      body: JSON.stringify(authData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  );
}

export async function logout() {
  return (
    await fetch('http://localhost:5000/auth/logout')
  );
}

export async function createPost(postData, postId) {
  let uri = 'http://localhost:5000/api/posts/public';
  if (postId) {
    uri += `/${postId}`;
  }

  return (
    await fetch(uri, {
      method: 'POST',
      body: JSON.stringify(postData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  );
}

export async function updatePostById(postId, newPostData) {
  return (
    await fetch(`http://localhost:5000/api/posts/public/${postId}`, {
      method: 'PATCH',
      body: JSON.stringify(newPostData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  );
}

export async function removePostById(postId) {
  return (
    await fetch(`http://localhost:5000/api/posts/public/${postId}`, {
      method: 'DELETE'
    })
  );
}

export async function getAllPosts(filters = '') {
  return (
    await fetch(`http://localhost:5000/api/posts/public?${filters}`)
  );
}

export function isStatusOk(response) {
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
}
