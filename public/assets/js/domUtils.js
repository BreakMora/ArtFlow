export function getFormFields(form) {
  const email = form.querySelector('input[type="email"]').value.trim();
  const name = form.querySelector('input[placeholder*="nombre"]').value.trim();
  const username = form.querySelector('input[placeholder*="nombre123"]').value.trim();
  const password = form.querySelectorAll('input[type="password"]')[0].value.trim();
  const confirmPassword = form.querySelectorAll('input[type="password"]')[1].value.trim();

  const [firstName, ...rest] = name.split(" ");
  const lastName = rest.join(" ");

  return {
    email,
    name,
    username,
    password,
    confirmPassword,
    firstName,
    lastName,
    gender: "prefer_not_to_say", 
    birthDate: "2000-01-01"
  };
}
