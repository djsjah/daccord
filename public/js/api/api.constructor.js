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

export async function getUserAuthData() {
  return (
    await fetch('http://localhost:5000/auth/payload')
  );
}

export async function getAllUsers(searchString = '') {
  return (
    await fetch(`http://localhost:5000/api/users/admin?search=${searchString}`)
  );
}

export async function getUserPosts(filters = '') {
  return (
    await fetch(`http://localhost:5000/api/posts/public?${filters}`)
  );
}

export function isStatusOk(response) {
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
}
