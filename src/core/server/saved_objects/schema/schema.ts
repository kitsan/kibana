/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { LegacyConfig } from '../../legacy';

/**
 * @deprecated
 * @internal
 **/
interface SavedObjectsSchemaTypeDefinition {
  isNamespaceAgnostic?: boolean;
  multiNamespace?: boolean;
  hidden?: boolean;
  indexPattern?: ((config: LegacyConfig) => string) | string;
  convertToAliasScript?: string;
}

/**
 * @deprecated
 * @internal
 **/
export interface SavedObjectsSchemaDefinition {
  [type: string]: SavedObjectsSchemaTypeDefinition;
}

/**
 * @deprecated This is only used by the {@link SavedObjectsLegacyService | legacy savedObjects service}
 * @internal
 **/
export class SavedObjectsSchema {
  private readonly definition?: SavedObjectsSchemaDefinition;
  constructor(schemaDefinition?: SavedObjectsSchemaDefinition) {
    this.definition = schemaDefinition;
  }

  public isHiddenType(type: string) {
    if (this.definition && this.definition.hasOwnProperty(type)) {
      return Boolean(this.definition[type].hidden);
    }

    return false;
  }

  public getIndexForType(config: LegacyConfig, type: string): string | undefined {
    if (this.definition != null && this.definition.hasOwnProperty(type)) {
      const { indexPattern } = this.definition[type];
      return typeof indexPattern === 'function' ? indexPattern(config) : indexPattern;
    } else {
      return undefined;
    }
  }

  public getConvertToAliasScript(type: string): string | undefined {
    if (this.definition != null && this.definition.hasOwnProperty(type)) {
      return this.definition[type].convertToAliasScript;
    }
  }

  public isNamespaceAgnostic(type: string) {
    // if no plugins have registered a Saved Objects Schema,
    // this.schema will be undefined, and no types are namespace agnostic
    if (!this.definition) {
      return false;
    }

    const typeSchema = this.definition[type];
    if (!typeSchema) {
      return false;
    }
    return Boolean(typeSchema.isNamespaceAgnostic);
  }

  public isSingleNamespace(type: string) {
    // if no plugins have registered a Saved Objects Schema,
    // this.schema will be undefined, and all types are namespace isolated
    if (!this.definition) {
      return true;
    }

    const typeSchema = this.definition[type];
    if (!typeSchema) {
      return true;
    }
    return !Boolean(typeSchema.isNamespaceAgnostic) && !Boolean(typeSchema.multiNamespace);
  }

  public isMultiNamespace(type: string) {
    // if no plugins have registered a Saved Objects Schema,
    // this.schema will be undefined, and no types are multi-namespace
    if (!this.definition) {
      return false;
    }

    const typeSchema = this.definition[type];
    if (!typeSchema) {
      return false;
    }
    return !Boolean(typeSchema.isNamespaceAgnostic) && Boolean(typeSchema.multiNamespace);
  }
}
