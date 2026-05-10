---
title: About
description: About Anshuman Pandey and his writing background.
portrait_image: /assets/uploads/img-20260218-133159763-1-1.webp
portrait_alt: Portrait of Anshuman Pandey
portrait_caption: Anshuman Pandey
desk_page: true
---

<section class="section desk-page" aria-label="The Desk about Anshuman Pandey">
  <article class="desk-bio-card tactile-card">
    <figure class="desk-portrait-frame">
      <div
        class="about-portrait desk-portrait"
        role="img"
        aria-label="{{ page.portrait_alt | default: 'Portrait of Anshuman Pandey' | escape }}"
        style="background-image: url('{{ page.portrait_image | default: '/assets/about-portrait-default.jpg' | escape }}');"
      ></div>
      <figcaption class="about-caption">{{ page.portrait_caption | default: 'Anshuman Pandey' | escape }}</figcaption>
    </figure>

    <div class="desk-bio-copy">
      <p class="desk-kicker">The Desk</p>
      <h2>Student writer, archive-builder, and occasional vibe-coder.</h2>
      <p>Words come out of me now and then. Not always planned — some stretch into essays that pull apart why mainstream stories collapse under their own weight. Others take shape as poems, handed to individuals who might never earn such attention.</p>
      <p>I’m Anshuman Pandey — currently studying, writing regularly, yet always circling back to questions about storytelling: its mechanics, its failures, and the strange balance between irony and honesty.</p>
      <p>Writing has taken me through student protests, made-up futures where everyone suffers, love treated like a business deal, and deities crafted simply so someone else gets blamed when life goes wrong.</p>
    </div>
  </article>

  <div class="desk-link-grid" aria-label="Desk links">
    <a class="desk-link-card tactile-deboss" href="/achievements/">
      <span>Milestones</span>
      <strong>See achievements</strong>
    </a>
    <a class="desk-link-card tactile-deboss" href="/resume/">
      <span>Resume</span>
      <strong>Open résumé</strong>
    </a>
    <a class="desk-link-card tactile-deboss" href="/contact/">
      <span>Contact</span>
      <strong>Send a note</strong>
    </a>
  </div>

  <section class="desk-timeline" aria-labelledby="desk-timeline-title">
    <div class="desk-timeline-heading">
      <p class="desk-kicker">Pinned notes</p>
      <h2 id="desk-timeline-title">A few things currently on the desk.</h2>
    </div>

    <div class="desk-timeline-track" aria-hidden="true"></div>

    <div class="desk-timeline-list">
      <details class="desk-node tactile-card" open>
        <summary>
          <span class="desk-node-dot" aria-hidden="true"></span>
          <span>
            <small>Writing</small>
            <strong>Portfolio archive</strong>
          </span>
        </summary>
        <p>A growing home for poems, prose, essays, projects, and experiments that would otherwise be scattered everywhere.</p>
      </details>

      <details class="desk-node tactile-card">
        <summary>
          <span class="desk-node-dot" aria-hidden="true"></span>
          <span>
            <small>Learning</small>
            <strong>B.Com Hons student</strong>
          </span>
        </summary>
        <p>Currently studying while building writing, research, web, and communication skills in public.</p>
      </details>

      <details class="desk-node tactile-card">
        <summary>
          <span class="desk-node-dot" aria-hidden="true"></span>
          <span>
            <small>Work</small>
            <strong>Open to collaborations</strong>
          </span>
        </summary>
        <p>Available for writing, editing, blogging, ghostwriting, and projects where words need structure and personality.</p>
      </details>
    </div>
  </section>
</section>
