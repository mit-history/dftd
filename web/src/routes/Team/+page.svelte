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
        { name: "Professor Ulla Kallenbach", link: "https://www4.uib.no/en/find-employees/Ulla.Kallenbach" },
        { name: "Professor Anne McCants", link: "https://history.mit.edu/people/anne-e-c-mccants/" },
        { name: "Professor Jeffrey Ravel", link: "https://history.mit.edu/people/jeffrey-s-ravel/" }
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
            { name: "Professor Frans Blom, University of Amsterdam", link: "https://www.uva.nl/en/profile/b/l/f.r.e.blom/f.r.e.blom.html#Research" },
            { name: "Harm Nijboer" }
          ]
        },
        {
          name: "Theatronomics",
          link: "https://www.theatronomics.com/",
          members: [
            { name: "Professor David O'Shaugnessy, University of Galway", link: "https://research.universityofgalway.ie/en/persons/david-oshaughnessy" },
            { name: "David Kelley, University of Galway", link: "https://www.theatronomics.com/team/david-kelly-digital-humanities-developer/" }
          ]
        },
        {
          name: "Theatre in Saint Domingue",
          link: "https://www.theatreinsaintdomingue.org/",
          members: [
            { name: "Professor Julia Prest, University of St. Andrews", link: "https://www.st-andrews.ac.uk/modern-languages/people/french/jtp22/" },
            { name: "Swithun Crowe, University of St. Andrews", link: "https://researchcomputing.wp.st-andrews.ac.uk/team/" },
            { name: "Mary Woodcock Kroble, University of St. Andrews", link: "https://researchcomputing.wp.st-andrews.ac.uk/team/" }
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
            { name: "Jamie Folsom, Partner", link: "https://www.performantsoftware.com/about/" },
            { name: "Rebecca Black, Software Developer", link: "https://www.performantsoftware.com/about/" }
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
                  <img src={base + "/images/blank_prof.jpeg"} alt="Profile image" />
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
              <img src={base + "/images/blank_prof.jpeg"} alt="Profile image" />
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
  .team-page {
    padding: 2rem;
    max-width: 1000px;
    margin: 0 auto;
    font-family: Georgia, serif;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    text-align: center;
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
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 50%;
    margin-bottom: 0.5rem;
  }

  .name {
    font-size: 1rem;
  }

  a {
    color: #0055a5;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
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
