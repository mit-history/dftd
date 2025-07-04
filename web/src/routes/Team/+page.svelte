<svelte:head>
  <title>Team</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
</svelte:head>

<script>
  import { base } from '$app/paths';

  const teamSections = [
    {
      label: "Project Co-Directors",
      members: [
        { name: "Professor Ulla Kallenbach", link: "https://www4.uib.no/en/find-employees/Ulla.Kallenbach", image: base + "/images/ulla_photo.jpg"  },
        { name: "Professor Anne McCants", link: "https://history.mit.edu/people/anne-e-c-mccants/", image: base + "/images/Anne-McCants-photo.jpg" },
        { name: "Professor Jeffrey Ravel", link: "https://history.mit.edu/people/jeffrey-s-ravel/", image: base + "/images/Jeff_photo.png"}
      ]
    },
    {
      label: "University of Bergen Team",
      members: [
        { name: "Henrik Askjar", link: "https://www4.uib.no/en/find-employees/Henrik.Askjer" },
        { name: "Mattis Pettersen" },
        { name: "Juliane Tiemann", link: "https://www4.uib.no/en/find-employees/Juliane.Marie-Th%C3%A9r%C3%A8se.Raukki.%28Tiemann%29" }
      ]
    },
    {
      label: "MIT Team",
      members: [
        { name: "Rhea Bhattacharjee", link: "https://shass.mit.edu/people/rhea-bhattacharjee/" },
        { name: "Nony Otu Ugwu" },
        { name: "Elaine Yang" }
      ]
    },
    {
      label: "Affiliated Project Teams",
      subgroups: [
        {
          name: "Onstage",
          link: "https://www.vondel.humanities.uva.nl/onstage/",
          members: [
            { name: "Professor Frans Blom, University of Amsterdam", link: "https://www.uva.nl/en/profile/b/l/f.r.e.blom/f.r.e.blom.html#Research", image: base + "/images/frans.blom.jpg" },
            { name: "Harm Nijboer" }
          ]
        },
        {
          name: "Theatronomics",
          link: "https://www.theatronomics.com/",
          members: [
            { name: "Professor David O'Shaughnessy, University of Galway", link: "https://research.universityofgalway.ie/en/persons/david-oshaughnessy", image: base + "/images/David_OShaughnessy_photo.jpeg"},
            { name: "David Kelly, University of Galway", link: "https://www.theatronomics.com/team/david-kelly-digital-humanities-developer/" }
          ]
        },
        {
          name: "Theatre in Saint Domingue",
          link: "https://www.theatreinsaintdomingue.org/",
          members: [
            { name: "Professor Julia Prest, University of St Andrews", link: "https://www.st-andrews.ac.uk/modern-languages/people/french/jtp22/", image: base + "/images/thumbnail_image001.jpg" },
            { name: "Swithun Crowe, University of St Andrews", link: "https://researchcomputing.wp.st-andrews.ac.uk/team/", image: base + "/images/Swithun Crowe.jpg"},
            { name: "Mary Woodcock Kroble, University of St Andrews", link: "https://researchcomputing.wp.st-andrews.ac.uk/team/" }
          ]
        }
      ]
    },
    {
      label: "Development Support",
      subgroups: [
        {
          name: "Performant Software Solutions",
          link: "https://www.performantsoftware.com/",
          members: [
            { name: "Jamie Folsom, Partner", link: "https://www.performantsoftware.com/about/", image: base + "/images/Jamie.webp" },
            { name: "Rebecca Black, Software Developer", link: "https://www.performantsoftware.com/about/", image: base + "/images/Rebecca.png" }
          ]
        }
      ]
    }
  ];
</script>

<section class="team-page">
  <h1>Project Team Members</h1>
  {#each teamSections as section}
    <div class="section">
      <h2>{section.label}</h2>

      {#if section.subgroups}
        {#each section.subgroups as group}
          <div class="subgroup">
            <h3>
              {#if group.link}
                <a href={group.link} target="_blank">{group.name}</a>
              {:else}
                {group.name}
              {/if}
            </h3>
            <div class="member-grid">
              {#each group.members as member}
                <div class="member-card">
                  <img src={member.image ?? base + "/images/blank_prof.jpeg"} alt="Profile image" />
                  <div class="name">
                    {#if member.link}
                      <a href={member.link} target="_blank">{member.name}</a>
                    {:else}
                      {member.name}
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      {:else}
        <div class="member-grid">
          {#each section.members as member}
            <div class="member-card">
              <img src={member.image ?? base + "/images/blank_prof.jpeg"} alt="Profile image" />
              <div class="name">
                {#if member.link}
                  <a href={member.link} target="_blank">{member.name}</a>
                {:else}
                  {member.name}
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</section>

<style>

  :global(body) {
    font-family: 'Inter', sans-serif;
  }
  .team-page {
    padding: 2rem;
    max-width: 1000px;
    margin: 0 auto;
    font-family: 'Inter', sans-serif;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    text-align: center;
    margin-top: 4rem;
  }

  .section {
    margin-bottom: 3rem;
  }

  h2 {
    font-size: 1.6rem;
    margin-bottom: 1rem;
    color: #333;
    border-bottom: 1px solid #ccc;
    padding-bottom: 0.3rem;
  }

  h3 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    margin-top: 2rem;
    color: #0055a5;
  }

  .member-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1.5rem;
  }

  .member-card {
    text-align: center;
  }

  .member-card img {
      width: 10rem;
      height: 10.8rem;
      object-fit: cover;
      border-radius: 12px;
      margin-bottom: 0.5rem;
      }

  .name {
    font-size: 1rem;
  }

  a {
    color: black;
    text-decoration: none;
  }

  a:hover {
    text-decoration: none;
    color: rgb(200, 76, 171);
  }

  @media (max-width: 600px) {
    .team-page {
      padding: 1rem;
    }
    h1 {
      font-size: 2rem;
    }
    h2 {
      font-size: 1.3rem;
    }
  }
</style>
