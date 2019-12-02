const schemaUrl = 'https://schema.org/';
const lcyUrl = 'http://purl.org/vocab/lifecycle/schema#';
const dceUrl = 'http://purl.org/dc/elements/1.1/';
const mebUrl = "http://rdf.myexperiment.org/ontologies/base/";
const ovUrl = "http://open.vocab.org/terms/";
const moUrl = "http://purl.org/ontology/mo/";
const vndJeeraUrl = "https://github.com/loosely-coupled-API/jeera_vocabulary/blob/master/vocab.ttl#";
const vndJeeraUrlRel = vndJeeraUrl + "rel/";

const vocabularies = {
  schema: {
    url: schemaUrl,
    terms: {
      mainEntityOfPage: schemaUrl + 'mainEntityOfPage',
      email: schemaUrl + 'email',
      Project: schemaUrl + 'Project',
      name: schemaUrl + 'name',
      description: schemaUrl + 'description',
      lastUpdatedOn: schemaUrl + 'dateModified',
      lastUpdate: schemaUrl + 'dateModified',
      Error: schemaUrl + 'Error'
    }
  },
  lcy: {
    url: lcyUrl,
    terms: {}
  },
  dce: {
    url: dceUrl,
    terms: {}
  },
  meb: {
    url: mebUrl,
    terms: {
      username: mebUrl + 'username'
    }
  },
  ov: {
    url: ovUrl,
    terms: {
      password: ovUrl + 'passwd'
    }
  },
  mo: {
    url: moUrl,
    terms: {}
  },
  vnd_jeera: {
    url: vndJeeraUrl,
    terms: { 
      LoginConfirmation: vndJeeraUrl + 'LoginConfirmation',
      role: vndJeeraUrl + 'role',
      UserRole: vndJeeraUrl + 'UserRole',
      CreateUserRequest: vndJeeraUrl + 'CreateUserRequest',
      CreateProjectRequest: vndJeeraUrl + 'CreateProjectRequest',
      UpdatePasswordRequest: vndJeeraUrl + 'UpdatePasswordRequest',
      previousPassword: vndJeeraUrl + 'previousPassword',
      newPassword: vndJeeraUrl + 'newPassword',
      ProjectsList: vndJeeraUrl + 'ProjectsList',
      listProjects: vndJeeraUrl + 'listProjects',
      projects: vndJeeraUrl + 'projects',
      collaborators: vndJeeraUrl + 'collaborators',
      UserStory: vndJeeraUrl + 'UserStory',
      UserStoryUpdateRequest: vndJeeraUrl + 'UserStoryUpdateRequest',
      UserStoryCreationRequest: vndJeeraUrl + 'UserStoryCreationRequest',
      TechnicalStory: vndJeeraUrl + 'TechnicalStory',
      TechnicalStoryCreationRequest: vndJeeraUrl + 'TechnicalStoryCreationRequest',
      TechnicalStoryUpdateRequest: vndJeeraUrl + 'TechnicalStoryUpdateRequest',
      points: vndJeeraUrl + 'points',
      projectId: vndJeeraUrl + 'projectId',
      taskId: vndJeeraUrl + 'taskId',
      assignee: vndJeeraUrl + 'assignee',
      Task: vndJeeraUrl + 'Task',
      TaskStatus: vndJeeraUrl + 'TaskStatus',
      TasksList: vndJeeraUrl + 'TasksList',
      status: vndJeeraUrl + 'status',
      TaskStatusFreeToMove: vndJeeraUrl + 'TaskStatusFreeToMove',
      isArchived: vndJeeraUrl + 'isArchived',
      updatesCount: vndJeeraUrl + 'updatesCount',
      EmailOwnershipConfirmation: vndJeeraUrl + 'EmailOwnershipConfirmation',
      getProjectDetails: vndJeeraUrl + 'getProjectDetails',
      isPublic: vndJeeraUrl + 'isPublic',
      createRelation: vndJeeraUrlRel + 'create',
      JWT: vndJeeraUrl + 'JWT',
      tasks: vndJeeraUrl + 'tasks'
    },
    actions: {
      login: vndJeeraUrl + 'login',
      logout: vndJeeraUrl + 'logout',
      getCurrentUserDetails: vndJeeraUrl + 'getCurrentUserDetails'
    },
    relations: {
      listProjectTasks: vndJeeraUrl + 'rel/listProjectTasks'
    }
  }
};

export default vocabularies;
