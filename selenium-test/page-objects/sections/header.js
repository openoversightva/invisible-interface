import Section from './section';


class LogoSection extends Section {
  constructor(parentSelector) {
    super(parentSelector);
    this.prepareElementGetters({
      mainElement: '//div[@class="logo"]',
      editButton: '//span[@class="top-button-wrapper"]//a[@class="hoverable-edit-wrapper-button"]',
      saveButton: '//span[@class="bottom-button-wrapper"]//a[@class="hoverable-edit-wrapper-button"]',
      cancelButton: '//span[@class="bottom-button-wrapper"]//a[@class="hoverable-edit-wrapper-button"][2]',
      title: '//*[contains(@class, "header-logo-title")]',
      subtitle: '//div[contains(@class, "header-logo-subtitle")]',
      subtitleFirstLine: '//div[contains(@class, "header-logo-subtitle")]//div[@data-block="true"][1]',
      boldTextSpan: '(//div[contains(@class, "header-logo-subtitle")]' +
        '//span[@data-offset-key and contains(@style, "font-weight: bold;")]/span)[1]',
      italicTextSpan: '(//div[contains(@class, "header-logo-subtitle")]' +
        '//span[@data-offset-key and contains(@style, "font-style: italic;")]/span)[1]',
      linkTextSpan: '(//div[contains(@class, "header-logo-subtitle")]' +
        '//span[contains(@style, "text-decoration: underline;")]/span[@data-offset-key]/span)[1]',
    });
  }
}

class DemoVideoSection extends Section {
  constructor(parentSelector) {
    super(parentSelector);

    const playButtonSelector = '//div[@class="demo-video-button"]';
    this.prepareElementGetters({
      mainElement: '//div[contains(@class, "demo-video__demo-video")]',
      upperText: '//span[@class="demo-video-text-upper"]',
      lowerText: '//span[@class="demo-video-text-lower"]',
      playButton: playButtonSelector,
      playButtonThumbnail: `${ playButtonSelector }//img[@class="demo-video-thumbnail"]`,
    });
  }
}

class TopBarSection extends Section {
  constructor(parentSelector) {
    super(parentSelector);

    this.prepareElementGetters({
      mainElement: '//div[@class="top-bar"]',
      logo: LogoSection,
      demoVideo: DemoVideoSection,
    });
  }
}

class SearchBoxSection extends Section {
  constructor(parentSelector) {
    super(parentSelector);

    const searchMagnifyingGlassSelector = '//*[name()="svg" and contains(@class, "search-box-magnifying-glass")]';
    this.prepareElementGetters({
      mainElement: '//div[contains(@class, "search-box__search-box")]',
      searchMagnifyingGlass: searchMagnifyingGlassSelector,
      searchMagnifyingGlassPath: `${searchMagnifyingGlassSelector}//*[name()="path"]`,
      searchText: '//span[@class="search-box-search-text"]',
      searchTerm: '//span[@class="search-box-term"]',
      playButtonThumbnail: '//div[@class="demo-video-button"]//img[@class="demo-video-thumbnail"]',
    });
  }
}

class RightLinksSection extends Section {
  constructor(parentSelector) {
    super(parentSelector);

    this.prepareElementGetters({
      mainElement: '//div[contains(@class, "right-links__right-links")]',
      data: '//a[text()="Data"]',
      qa: '//a[text()="Q&A"]',
      documents: '//a[text()="Documents"]',
    });
  }
}

class NavBarSection extends Section {
  constructor(parentSelector) {
    super(parentSelector);
    this.prepareElementGetters({
      mainElement: '//div[@class="navbar"]',
      logOutButton: '//a[contains(@class, "test--logout-button")]',
      searchBox: SearchBoxSection,
      rightLinks: RightLinksSection,
    });
  }
}

class Header extends Section {
  constructor(parentSelector, mainElementSelector='') {
    super(parentSelector);

    this.prepareElementGetters({
      mainElement: mainElementSelector,
      topBar: TopBarSection,
      navBar: NavBarSection,
    });
  }
}

class TopHeader extends Header {
  constructor(parentSelector) {
    super(parentSelector, '//div[@class="test--top-slim-header"]');
  }
}

class SlimHeader extends Header {
  constructor(parentSelector) {
    super(parentSelector, '//div[contains(@class, "slim-header__sticky-slim-header")]');
  }
}

module.exports = {
  TopHeader,
  SlimHeader
};
