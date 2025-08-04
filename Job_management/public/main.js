const jobListings = document.getElementById("job-listings");
const searchInput = document.getElementById("searchInput");
const locationFilter = document.getElementById("locationFilter");
const typeFilter = document.getElementById("typeFilter");
const salaryRange = document.getElementById("salaryRange");
const salaryValue = document.getElementById("salaryValue");

let jobsData = [];

fetch("/api/jobs")
  .then(res => res.json())
  .then(data => {
    jobsData = data;
    renderJobs(jobsData);
  });

function renderJobs(jobs) {
  jobListings.innerHTML = "";
  jobs.forEach(job => {
    const col = document.createElement("div");
    col.className = "col";
    col.innerHTML = `
      <div class="card shadow h-100">
        <div class="card-body d-flex flex-column">
          <div class="d-flex align-items-center mb-3">
            <img src="${job.logo}" alt="${job.company}" class="me-3" style="width: 40px; height: 40px; object-fit: contain;">
            <h5 class="mb-0">${job.title}</h5>
          </div>
          <p class="text-muted mb-1">${job.company}</p>
          <p class="mb-1">Location: ${job.location}</p>
          <p class="mb-1">Type: ${job.type}</p>
          <p class="mb-1">Salary: ${job.salary}</p>
          <p class="mb-1">Experience: ${job.experience || '0-2 yrs'}</p>
          <p class="text-muted small flex-grow-1">${job.description}</p>
          <button class="btn btn-primary mt-3 w-100">Apply Now</button>
        </div>
      </div>
    `;
    jobListings.appendChild(col);
  });
}

[searchInput, locationFilter, typeFilter, salaryRange].forEach(input => {
  input.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const location = locationFilter.value;
    const type = typeFilter.value;
    const maxSalary = parseInt(salaryRange.value);
    salaryValue.textContent = `₹${maxSalary}`;

    const filtered = jobsData.filter(job => {
      const salaryNum = parseInt(job.salary.replace(/[^\d]/g, "")) || 0;
      return (
        (!query || job.title.toLowerCase().includes(query)) &&
        (!location || job.location === location) &&
        (!type || job.type === type) &&
        (!maxSalary || salaryNum <= maxSalary)
      );
    });

    renderJobs(filtered);
  });
});

const jobForm = document.getElementById("jobForm");
jobForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const newJob = {
    title: document.getElementById("jobTitle").value,
    company: document.getElementById("companyName").value,
    location: document.getElementById("location").value,
    type: document.getElementById("jobType").value,
    salary: `${document.getElementById("salaryMin").value}-${document.getElementById("salaryMax").value} LPA`,
    logo: "https://via.placeholder.com/40",
    experience: "0-2 yrs",
    description: document.getElementById("description").value
  };

  try {
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newJob)
    });

    if (!res.ok) throw new Error("Failed to create job");

    jobsData.push(newJob);
    renderJobs(jobsData);
    jobForm.reset();

    // If using Bootstrap modal, close it
    const modalEl = document.getElementById("createJobModal");
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Failed to save job");
  }
});