
  <div class="hero-content reveal">
    <p class="section-eyebrow">Writer · Student · Occasionally vibe-codes</p>
    <h1 class="hero-title" id="hero-title">{{ site.data.site.site_title | default: 'Anshuman3kdka' }}</h1>
    <p class="hero-lead">{{ site.data.site.site_tagline | default: "I write essays, fiction, and poetry. Usually about literature, occasionally about why most of it fails." }}</p>
    <div class="hero-actions">
      <a class="button button-primary" href="/essays/">Essays →</a>
      <a class="button button-secondary" href="/projects/">Projects →</a>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="featured-title">
  <div class="page-intro reveal">
    <p class="section-eyebrow">{{ site.data.site.featured_cards_eyebrow | default: "Featured Cards" }}</p>
    <h2 class="section-title" id="featured-title">{{ site.data.site.featured_cards_title | default: "Highlights from the archive" }}</h2>
    <p class="section-subtitle">{{ site.data.site.featured_cards_subtitle | default: "Manage these cards in Pages CMS under Home Page Cards." }}</p>
  </div>
  <div class="grid grid-2">
    {% assign homepage_cards = site.data.home_cards.cards %}
    {% if homepage_cards and homepage_cards.size > 0 %}
      {% for card in homepage_cards %}
      <article class="card reveal">
        <p class="card-label">{{ card.type }}</p>
        <h3 class="card-title">{{ card.title }}</h3>
        <p class="card-text">{{ card.description }}</p>
        {% assign card_href = card.link_url | default: '#' %}
        {% if card_href contains '://' or card_href contains 'mailto:' or card_href contains 'tel:' or card_href contains '#' %}
        <a class="card-link" href="{{ card_href }}">{{ card.link_text }}</a>
        {% else %}
        <a class="card-link" href="{{ card_href | relative_url }}">{{ card.link_text }}</a>
        {% endif %}
      </article>
      {% endfor %}
    {% else %}
      <article class="card reveal">
        <p class="card-text">Add your first card in Pages CMS under Home Page Cards.</p>
      </article>
    {% endif %}
  </div>
</section>
